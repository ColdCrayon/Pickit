//
//  HeaderViewViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/9/25.
//

import FirebaseFirestore
import FirebaseAuth

import SwiftUI

final class HeaderViewViewModel: ObservableObject {
    @Published var currentUserId: String = ""
    
    let db = Firestore.firestore()
    
    private var handler: AuthStateDidChangeListenerHandle?
    
    init() {
        self.handler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                // GET CURRENT USER ID
                self?.currentUserId = user?.uid ?? ""
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
