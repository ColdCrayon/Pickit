//
//  PickitApp.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/3/24.
//

import SwiftUI
import FirebaseCore

@main
struct PickitApp: App {
     init() {
        FirebaseApp.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            PickitView()
        }
    }
}
