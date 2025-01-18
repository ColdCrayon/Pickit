//
//  AccountViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/17/25.
//

import SwiftUI

final class AccountViewModel: ObservableObject {
    @Published var username: String = ""
    @Published var fullName: String = ""
    @Published var password: String = ""
    @Published var email: String = ""
    
    func getUsername() -> String {
        return self.username
    }
    
    func getFullName() -> String {
        return self.fullName
    }
    
    func getPassword() -> String {
        return self.password
    }
    
    func getEmail() -> String {
        return self.email
    }
}
