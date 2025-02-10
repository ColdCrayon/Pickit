//
//  ArbitrageViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/12/25.
//

import FirebaseFirestore
import FirebaseAuth

import SwiftUI

final class ArbitrageViewModel: ObservableObject {
    
    @Published var arbitrageTickets: [ArbitrageTicket] = []
    @Published var alertItem: AlertItem?
    @Published var isLoading = false
    @Published var currentUserId: String = ""
    @Published var isPremium: Bool = false
    
    let db = Firestore.firestore()
    
    private var handler: AuthStateDidChangeListenerHandle?
    
    init() {
        isLoading = true
        self.handler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                // GET CURRENT USER ID
                self?.currentUserId = user?.uid ?? ""
                
                if(Auth.auth().currentUser != nil ) {
                    guard let ATicketcollection = self?.db.collection("arbTickets") else {
                        return
                    }
                    
                    guard let docUser = self?.db.collection("users").document(self?.currentUserId ?? "") else {
                        print("No user id found")
                        return
                    }
                    
                    Task {
                        let snapshot = try await ATicketcollection.getDocuments()
                        self?.isLoading = false
                        
                        for document in snapshot.documents {
                            let ticket = document.data()
                            
                            let arbTicket = ArbitrageTicket(id: ticket["id"] as! String,
                                                            settled: ticket["settled"] as! Bool,
                                                            sportsBook1: ticket["sportsBook1"] as! String,
                                                            sportsBook2: ticket["sportsBook2"] as! String,
                                                            pickGameInfo: ticket["pickGameInfo"] as! String,
                                                            pickOddsSB1: ticket["pickOddsSB1"] as! String,
                                                            pickOddsSB2: ticket["pickOddsSB2"] as! String,
                                                            pickPublishDate: getTicketDate(),
                                                            pickDescription: ticket["pickDescription"] as! String,
                                                            pickTeam: ticket["pickTeam"] as! String,
                                                            pickType: ticket["pickType"] as! String)
                            
                            self?.arbitrageTickets.append(arbTicket)
                            print("Arbitrage Ticket Added")
                        }
                        print(self?.arbitrageTickets.count ?? 0)
                        
                        let document = try await docUser.getDocument()
                        let data = document.data()
                        self?.isPremium = data?["isPremium"] as? Bool ?? false
                    }
                }
            }
        }
    }
    
}
