//
//  PickitViewViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/26/25.
//

import FirebaseAuth
import FirebaseCore
import SwiftUI

final class PickitViewViewModel: ObservableObject {
    @Published var currentUserId: String = ""
    
    private var handler: AuthStateDidChangeListenerHandle?
    
    init() {
        self.handler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                self?.currentUserId = user?.uid ?? ""
            }
        }
    }
    
    public var isSignedIn: Bool {
        withAnimation(.easeInOut(duration: 0.3)) {
            return Auth.auth().currentUser != nil
        }
    }
    
    public var username: String {
        Auth.auth().currentUser?.uid ?? ""
    }
}
