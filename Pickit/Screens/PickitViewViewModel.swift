//
//  PickitViewViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/26/25.
//

import FirebaseAuth
import FirebaseCore
import FirebaseFirestore

import SwiftUI

final class PickitViewViewModel: ObservableObject {
    @Published var currentUserId: String = ""
    @Published var username: String = ""
    @Published var isPremium: Bool = false
    
    let db = Firestore.firestore()
    
    private var handler: AuthStateDidChangeListenerHandle?
    
    init() {
        self.handler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                self?.currentUserId = user?.uid ?? ""
                
                let docUser = self?.db.collection("users").document(self?.currentUserId ?? "")
                
                Task {
                    do {
                        guard let document = try await docUser?.getDocument() else {
                            print("Error getting document")
                            return
                        }
                        let data = document.data()
                        self?.username = data?["username"] as? String ?? ""
                        self?.isPremium = data?["isPremium"] as? Bool ?? false
                        
                        print("Document does not exist")
                        
                    } catch {
                        print("Error getting document: \(error)")
                    }
                }
            }
        }
    }
    
    public var isSignedIn: Bool {
        withAnimation(.easeInOut(duration: 0.3)) {
            return Auth.auth().currentUser != nil
        }
    }
    
    
    public func getUser() {
        
    }
}
