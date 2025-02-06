//
//  SignInViewViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/20/25.
//

import FirebaseAuth
import FirebaseFirestore
import Foundation

final class SignInViewViewModel: ObservableObject {
    @Published var username: String = ""
    @Published var fullName: String = ""
    @Published var password: String = ""
    @Published var email: String = ""
    
    @Published var errorMessageLogin: String = ""
    @Published var errorMessageRegister: String = ""
    
    init() {}
    
    func register() {
        guard validateRegister() else {
//            errorMessageRegister = "An error occured during registration"
            return
        }
        
        Auth.auth().createUser(withEmail: email, password: password) { [weak self] result, error in
            guard let userId = result?.user.uid else {
                print("Unable to create user")
                return
            }
            
            self?.insertUserRecord(id: userId)
            print("User Inserted")
        }
    }
    
    private func insertUserRecord(id: String) {
        let newUser = User(id: id,
                           name: fullName,
                           username: username,
                           email: email,
                           isPremium: false,
                           isAdmin: false,
                           joined: Date().timeIntervalSince1970)
        
        let db = Firestore.firestore()
        
        db.collection("users")
            .document(id)
            .setData(newUser.asDictionary())
    }
    
    func login() {
        guard validateLogin() else {
            errorMessageLogin = "An error occured during login"
            return
        }
        
        Auth.auth().signIn(withEmail: email, password: password)
    }
    
    func validateLogin() -> Bool {
        guard !email.trimmingCharacters(in: .whitespaces).isEmpty,
              !password.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessageLogin = "Please fill in all fields"
            return false
        }
        
        // email@foo.com
        guard email.contains("@"), email.contains(".") else {
            errorMessageLogin = "Please enter a valid email"
            return false
        }
        
        return true
    }
    
    func validateRegister() -> Bool {
//        print("Validating")
        guard !email.trimmingCharacters(in: .whitespaces).isEmpty,
              !username.trimmingCharacters(in: .whitespaces).isEmpty,
              !password.trimmingCharacters(in: .whitespaces).isEmpty,
              !fullName.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessageRegister = "Please fill in all fields"
            return false
        }
        
        guard email.contains("@"), email.contains(".") else {
            errorMessageRegister = "Please enter a valid email"
            return false
        }
        
        guard password.count >= 8 else {
            errorMessageRegister = "Your password must be at least 8 characters"
            return false
        }
        
        return true
    }
}
