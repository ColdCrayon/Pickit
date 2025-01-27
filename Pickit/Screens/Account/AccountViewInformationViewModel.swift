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
    @Published var username: String = ""
    @Published var fullName: String = ""
    @Published var password: String = ""
    @Published var email: String = ""
    
    @Published var errorMessageLogin: String = ""
    @Published var errorMessageRegister: String = ""
    
    init() {}
    
    func signOut() {
        do {
            try Auth.auth().signOut()
        } catch let signOutError as NSError {
            print("Error siging out: %@", signOutError)
        }
    }
}
