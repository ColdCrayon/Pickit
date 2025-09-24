//
//  HomeViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/12/25.
//

import FirebaseAuth
import FirebaseFirestore
import SwiftUI

final class HomeViewModel: ObservableObject {

    @Published var tickets: [Ticket] = []
    @Published var arbTickets: [ArbitrageTicket] = []
    @Published var alertItem: AlertItem?
    @Published var isLoading = false

    let db = Firestore.firestore()

    private var handler: AuthStateDidChangeListenerHandle?

    init() {
        isLoading = true
        self.handler = Auth.auth().addStateDidChangeListener {
            [weak self] _, user in
            DispatchQueue.main.async {
                //                if(Auth.auth().currentUser != nil ) {
                //                    // GET ALL AVAILABLE TICKETS
                //                    guard let GTicketcollection = self?.db.collection("gameTickets") else {
                //                        return
                //                    }
                //
                //                    guard let ArbTicketCollection = self?.db.collection("arbitrageTickets") else {
                //                        return
                //                    }
                //
                //                    Task {
                //                        let snapshot = try await GTicketcollection.getDocuments()
                //                        self?.isLoading = false
                //
                //                        // ADD TICKETS TO `tickets` LIST
                //                        for document in snapshot.documents {
                //                            let ticket = document.data()
                //
                //                            let gameTicket = Ticket(id: ticket["id"] as? String,
                //                                                    pickGameInfo: ticket["pickGameInfo"] as! String,
                //                                                    pickPublishDate: ticket["pickPublishDate"] as! String,
                //                                                    pickDescription: ticket["pickDescription"] as! String,
                //                                                    pickSportsbook: ticket["pickSportsbook"] as! String,
                //                                                    pickTeam: ticket["pickTeam"] as! String,
                //                                                    pickType: ticket["pickType"] as! String,
                //                                                    settleDate: ticket["settleDate"] as? Date ?? Date(),
                //                                                    serverSettled: ticket["serverSettled"] as? Bool ?? false)
                //
                //                            self?.tickets.append(gameTicket)
                //                        }
                //                    }
                //
                //                    Task {
                //                        let snapshot = try await ArbTicketCollection.getDocuments()
                //                        self?.isLoading = false
                //
                //                        // ADD TICKETS TO `arbTickets` LIST
                //                        for document in snapshot.documents {
                //                            let ticket = document.data()
                //
                //                            let arbTicket = ArbitrageTicket(id: ticket["id"] as? String,
                //                                                            sportsBook1: ticket["sportsBook1"] as! String,
                //                                                            sportsBook2: ticket["sportsBook2"] as! String,
                //                                                            pickGameInfo: ticket["pickGameInfo"] as! String,
                //                                                            pickOddsSB1: ticket["pickOddsSB1"] as! String,
                //                                                            pickOddsSB2: ticket["pickOddsSB2"] as! String,
                //                                                            pickPublishDate: ticket["pickPublishDate"] as! String,
                //                                                            pickDescription: ticket["pickDescription"] as! String,
                //                                                            pickTeam: ticket["pickTeam"] as! String,
                //                                                            pickType: ticket["pickType"] as! String,
                //                                                            settleDate: ticket["settleDate"] as? Date ?? Date(),
                //                                                            serverSettled: ticket["serverSettled"] as? Bool ?? false)
                //
                //                            self?.arbTickets.append(arbTicket)
                //                        }
                //                    }
                //                }
                if user != nil {
                    Task {
                        await self?.fetchGameTickets(for: user?.uid ?? "")
                        await self?.fetchArbTickets(for: user?.uid ?? "")
                        self?.isLoading = false
                    }
                } else {
                    self?.tickets = []
                    self?.arbTickets = []
                    self?.isLoading = false
                }
            }
        }
    }

    @MainActor
    private func fetchGameTickets(for uid: String) async {
        do {
            // get user role
            let userDoc = try await db.collection("users").document(uid)
                .getDocument()
            let isPremium = userDoc.get("isPremium") as? Bool ?? false
            let isAdmin = userDoc.get("isAdmin") as? Bool ?? false

            // pick the query
            let collection = db.collection("gameTickets")
            let query: Query
            if isPremium || isAdmin {
                query = collection
            } else {
                query = collection.whereField("serverSettled", isEqualTo: true)
            }

            // fetch tickets
            let snapshot = try await query.getDocuments()
            let loaded = snapshot.documents.compactMap { doc in
                try? doc.data(as: Ticket.self)
            }

            //            var loaded: [Ticket] = []
            //            for document in snapshot.documents {
            //                do {
            //                    let ticket = try document.data(as: Ticket.self)
            //                    loaded.append(ticket)
            //                } catch {
            //                    print("Decoding error for gameTicket \(document.documentID): \(error)")
            //                    print("Raw data: \(document.data())")
            //                }
            //            }

            self.tickets = loaded
            print("Loaded \(loaded.count) game tickets")

        } catch {
            print("Error fetching gameTickets: \(error)")
        }
    }

    @MainActor
    private func fetchArbTickets(for uid: String) async {
        do {
            // get user role
            let userDoc = try await db.collection("users").document(uid)
                .getDocument()
            let isPremium = userDoc.get("isPremium") as? Bool ?? false
            let isAdmin = userDoc.get("isAdmin") as? Bool ?? false

            // pick the query
            let collection = db.collection("arbTickets")
            let query: Query
            if isPremium || isAdmin {
                query = collection
            } else {
                query = collection.whereField("serverSettled", isEqualTo: true)
            }

            // fetch tickets
            let snapshot = try await query.getDocuments()
            let loaded = snapshot.documents.compactMap { doc in
                try? doc.data(as: ArbitrageTicket.self)
            }

            self.arbTickets = loaded
            print("Loaded \(loaded.count) arbitrage tickets")

        } catch {
            print("Error fetching arbTickets: \(error)")
        }
    }
}
