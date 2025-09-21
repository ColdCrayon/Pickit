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
    @Published var alertItem: AlertItem?
    @Published var isLoading = false
    
    let db = Firestore.firestore()
    
    private var handler: AuthStateDidChangeListenerHandle?
    
    init() {
        isLoading = true
        self.handler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                if(Auth.auth().currentUser != nil ) {
                    // IMPLEMENT PREVIOUS TICKETS
                    guard let GTicketcollection = self?.db.collection("gameTickets") else {
                        return
                    }
                    
                    Task {
                        let snapshot = try await GTicketcollection.getDocuments()
                        self?.isLoading = false
                        
                        
                        for document in snapshot.documents {
                            let ticket = document.data()
                            
                            let gameTicket = Ticket(id: ticket["id"] as! String,
                                                    pickGameInfo: ticket["pickGameInfo"] as! String,
                                                    pickPublishDate: ticket["pickPublishDate"] as! String,
                                                    pickDescription: ticket["pickDescription"] as! String,
                                                    pickSportsbook: ticket["pickSportsbook"] as! String,
                                                    pickTeam: ticket["pickTeam"] as! String,
                                                    pickType: ticket["pickType"] as! String,
                                                    settleDate: ticket["settleDate"] as? TimeInterval ?? 0,
                                                    serverSettled: ticket["serverSettled"] as? Bool ?? false)
                            
                            self?.tickets.append(gameTicket)
                        }
                    }
                }
            }
        }
    }
    
    func getTickets() {
        
    }

}
