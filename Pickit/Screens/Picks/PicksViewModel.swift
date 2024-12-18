//
//  PicksViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/10/24.
//

import SwiftUI

final class PicksViewModel: ObservableObject {
    
    @Published var tickets: [Ticket] = MockTicket.sampleTickets
    @Published var alertItem: AlertItem?
    @Published var isLoading = false
    
    func getTickets() {
        
    }

}
