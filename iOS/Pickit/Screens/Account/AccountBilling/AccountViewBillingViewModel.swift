//
//  AccountViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/19/25.
//

import FirebaseAuth
import FirebaseFirestore
import SwiftUI

final class AccountViewBillingViewModel: ObservableObject {
    
    @Published var isPremium: Bool = false
    
    @Published var errorMessageUpgrade: String = ""
    
    init() {}
    
    func upgrade() {
        isPremium = true
    }
}

