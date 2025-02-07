//
//  PicksViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/10/24.
//

import FirebaseFirestore
import FirebaseCore
import FirebaseAuth

import SwiftUI

final class PicksViewModel: ObservableObject {
    
    @Published var tickets: [Ticket] = []
    @Published var alertItem: AlertItem?
    @Published var isLoading = false
    
    let db = Firestore.firestore()
    
    private var handler: AuthStateDidChangeListenerHandle?
    
    init() {
        self.handler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                if(Auth.auth().currentUser != nil ) {
                    guard let GTicketcollection = self?.db.collection("gameTickets") else {
                        return
                    }
                    
                    Task {
                        let snapshot = try await GTicketcollection.getDocuments()
                        
                        
                        for document in snapshot.documents {
                            let ticket = document.data()
                            
                            let gameTicket = Ticket(id: ticket["id"] as! String,
                                                    settled: ticket["settled"] as! Bool,
                                                    pickGameInfo: ticket["pickGameInfo"] as! String,
                                                    pickPublishDate: ticket["pickPublishDate"] as! String,
                                                    pickDescription: ticket["pickDescription"] as! String,
                                                    pickSportsbook: ticket["pickSportsbook"] as! String,
                                                    pickTeam: ticket["pickTeam"] as! String,
                                                    pickType: ticket["pickType"] as! String)
                            
                            self?.tickets.append(gameTicket)
                            print("Game Ticket Added")
                        }
                        print(self?.tickets.count ?? 0)
                    }
                }
            }
        }
    }
    
    func getTickets() {
//        DispatchQueue.main.async {
//            if(Auth.auth().currentUser != nil ) {
//                let GTicketcollection = self.db.collection("gameTickets")
//                
//                let snapshot = try await GTicketcollection.getDocuments()
//                
//                
//                for document in snapshot.documents {
//                    let ticket = document.data()
//                    
//                    let gameTicket = Ticket(id: ticket["id"] as! String,
//                                            settled: ticket["settled"] as! Bool,
//                                            pickGameInfo: ticket["pickGameInfo"] as! String,
//                                            pickPublishDate: ticket["pickPublishDate"] as! String,
//                                            pickDescription: ticket["pickDescription"] as! String,
//                                            pickSportsbook: ticket["pickSportsbook"] as! String,
//                                            pickTeam: ticket["pickTeam"] as! String,
//                                            pickType: ticket["pickType"] as! String)
//                    
//                    tickets.append(gameTicket)
//                    print("Tickets Added")
//                }
//            }
//        }
    }
    
}
