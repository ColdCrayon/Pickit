//
//  ArbitrageViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/12/25.
//

import SwiftUI

final class ArbitrageViewModel: ObservableObject {
    
    @Published var arbitrageTickets: [ArbitrageTicket] = MockTicket.sampleArbitrageTickets
    @Published var alertItem: AlertItem?
    @Published var isLoading = false
    
    func getTickets() {
        
    }
    
}
