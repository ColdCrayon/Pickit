//
//  AccountViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/17/25.
//

import FirebaseAuth
import FirebaseFirestore
import SwiftUI

final class AccountViewInformationViewModel: ObservableObject {
    @Published var currentUserId: String = ""
    @Published var username: String = ""
    @Published var fullName: String = ""
    @Published var password: String = ""
    @Published var email: String = ""
    @Published var isAdmin: Bool = false
    
    @Published var isLoading: Bool = false
    
    @Published var errorMessageLogin: String = ""
    @Published var errorMessageRegister: String = ""
    
    let db = Firestore.firestore()
    
    private var handler: AuthStateDidChangeListenerHandle?
    
    init() {
        isLoading = true
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
                            self?.isLoading = false
                            let data = document.data()
                            self?.username = data?["username"] as? String ?? ""
                            self?.fullName = data?["name"] as? String ?? ""
                            self?.email = data?["email"] as? String ?? ""
                            self?.isAdmin = data?["isAdmin"] as? Bool ?? false
                        } catch {
                            print("Error getting document: \(error)")
                        }
                    }
                }
            }
        }
    }
    
    func signOut() {
        do {
            try Auth.auth().signOut()
        } catch let signOutError as NSError {
            print("Error siging out: %@", signOutError)
        }
    }
}
