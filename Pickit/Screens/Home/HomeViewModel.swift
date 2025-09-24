//
//  HomeViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/12/25.
//

import FirebaseFirestore
import FirebaseAuth

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
        self.handler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                if(Auth.auth().currentUser != nil ) {
                    // GET ALL AVAILABLE TICKETS
                    guard let GTicketcollection = self?.db.collection("gameTickets") else {
                        return
                    }
                    
                    guard let ArbTicketCollection = self?.db.collection("arbitrageTickets") else {
                        return
                    }
                    
                    Task {
                        let snapshot = try await GTicketcollection.getDocuments()
                        self?.isLoading = false
                        
                        // ADD TICKETS TO `tickets` LIST
                        for document in snapshot.documents {
                            let ticket = document.data()
                            
                            let gameTicket = Ticket(id: ticket["id"] as! String,
                                                    pickGameInfo: ticket["pickGameInfo"] as! String,
                                                    pickPublishDate: ticket["pickPublishDate"] as! String,
                                                    pickDescription: ticket["pickDescription"] as! String,
                                                    pickSportsbook: ticket["pickSportsbook"] as! String,
                                                    pickTeam: ticket["pickTeam"] as! String,
                                                    pickType: ticket["pickType"] as! String,
                                                    settleDate: ticket["settleDate"] as? Timestamp ?? Timestamp(),
                                                    serverSettled: ticket["serverSettled"] as? Bool ?? false)
                            
                            self?.tickets.append(gameTicket)
                        }
                    }
                    
                    Task {
                        let snapshot = try await ArbTicketCollection.getDocuments()
                        self?.isLoading = false
                        
                        // ADD TICKETS TO `arbTickets` LIST
                        for document in snapshot.documents {
                            let ticket = document.data()
                            
                            let arbTicket = ArbitrageTicket(id: ticket["id"] as! String,
                                                            sportsBook1: ticket["sportsBook1"] as! String,
                                                            sportsBook2: ticket["sportsBook2"] as! String,
                                                            pickGameInfo: ticket["pickGameInfo"] as! String,
                                                            pickOddsSB1: ticket["pickOddsSB1"] as! String,
                                                            pickOddsSB2: ticket["pickOddsSB2"] as! String,
                                                            pickPublishDate: ticket["pickPublishDate"] as! String,
                                                            pickDescription: ticket["pickDescription"] as! String,
                                                            pickTeam: ticket["pickTeam"] as! String,
                                                            pickType: ticket["pickType"] as! String,
                                                            settleDate: ticket["settleDate"] as? Timestamp ?? Timestamp(),
                                                            serverSettled: ticket["serverSettled"] as? Bool ?? false)
                            
                            self?.arbTickets.append(arbTicket)
                        }
                    }
                }
            }
        }
    }
}
