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
                    guard let GTicketcollection = self?.db.collection("gameTickets") else {
                        return
                    }
                    
                    guard let docUser = self?.db.collection("users").document(self?.currentUserId ?? "") else {
                        print("No user id found")
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
                                                    settleDate: ticket["settleDate"] as? TimeInterval ?? 0)
                            
                            self?.tickets.append(gameTicket)
                        }
                        
                        let document = try await docUser.getDocument()
                        let data = document.data()
                        self?.isPremium = data?["isPremium"] as? Bool ?? false
                    }
                }
            }
        }
    }
    
    func getTickets() {
        // Tickets are automatically filtered by Firebase Security Rules
        // Only non-settled tickets will be returned based on server time
    }
    
}
