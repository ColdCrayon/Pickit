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
    @Published var isAdmin: Bool = false
    
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
                            self?.username = data?["username"] as? String ?? ""
                            self?.isPremium = data?["isPremium"] as? Bool ?? false
                            self?.isAdmin = data?["isAdmin"] as? Bool ?? false
                        } catch {
                            print("Error getting document: \(error)")
                        }
                    }
                }
            }
        }
    }
    
    // IF USERID EXISTS, isSignedIn = True
    public var isSignedIn: Bool {
        withAnimation(.easeInOut(duration: 0.3)) {
            return Auth.auth().currentUser != nil
        }
    }
}
