//
//  HomeViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/12/25.
//

import SwiftUI

final class HomeViewModel: ObservableObject {
    
    @Published var tickets: [Ticket] = MockTicket.sampleTickets
    @Published var alertItem: AlertItem?
    @Published var isLoading = false
    
    func getTickets() {
        
    }

}
