//
//  AccountViewViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/7/25.
//

import FirebaseAuth
import FirebaseFirestore

import SwiftUI

final class AccountViewViewModel: ObservableObject {
    @Published var currentUserId: String = ""
    @Published var isPremium: Bool = false
    
    let db = Firestore.firestore()
    
    private var handler: AuthStateDidChangeListenerHandle?
    
    init() {
        self.handler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                // GET CURRENT USER ID
                self?.currentUserId = user?.uid ?? ""
                
                // IF SIGNED IN, ACCESS USER DOCUMENT
                if(Auth.auth().currentUser != nil ) {
                    guard let docUser = self?.db.collection("users").document(self?.currentUserId ?? "") else {
                        print("No user id found")
                        return
                    }
                    
                    Task {
                        do {
                            // SET VIEWMODEL COMPONENTS
                            let document = try await docUser.getDocument()
                            let data = document.data()
                            self?.isPremium = data?["isPremium"] as? Bool ?? false
                        } catch {
                            print("Error getting document: \(error)")
                        }
                    }
                }
            }
        }
    }
}
