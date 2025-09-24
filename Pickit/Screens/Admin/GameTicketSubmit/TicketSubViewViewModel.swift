//
//  TicketSubViewViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/6/25.
//

import FirebaseFirestore
import Foundation

final class TicketSubViewViewModel: ObservableObject {
    @Published var settled: Bool = false
    @Published var pickTeam: String = ""
    @Published var pickType: String = ""
    @Published var gameInfo: String = ""
    @Published var description: String = ""
    @Published var sportsbook: String = ""
    @Published var settleDate: Date = Date()
//    @Published var settleDate: Timestamp = Timestamp()
    @Published var serverSettled: Bool = false
    
//  2025-03-06T19:20:40.285Z
    
    @Published var errorMessage: String = ""
    
    let db = Firestore.firestore()
    
    init() {}
    
    func validateTicket() -> Bool {
        guard !pickTeam.trimmingCharacters(in: .whitespaces).isEmpty,
              !pickType.trimmingCharacters(in: .whitespaces).isEmpty,
              !gameInfo.trimmingCharacters(in: .whitespaces).isEmpty,
              !description.trimmingCharacters(in: .whitespaces).isEmpty,
              !sportsbook.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "Please Fill Out All Fields"
            return false
        }
        
        return true
    }
    
    func submitTicket() {
        guard validateTicket() else {
//            errorMessage = "Unable to Validate Ticket"
            return
        }
        
        insertTicketRecord(id: generateTicketId())
    }
    
    private func insertTicketRecord(id: String) {
        let newTicket = Ticket(id: id,
                               pickGameInfo: gameInfo,
                               pickPublishDate: getTicketDate(),
                               pickDescription: description,
                               pickSportsbook: sportsbook,
                               pickTeam: pickTeam,
                               pickType: pickType,
                               settleDate: settleDate,
                               serverSettled: serverSettled)
        
        gameInfo = ""
        description = ""
        sportsbook = ""
        pickTeam = ""
        pickType = ""
        
        let db = Firestore.firestore()
        
        do {
            try db.collection("gameTickets")
                    .document(id)
                    .setData(from: newTicket)
        } catch
            {
            print("Error writing document: \(error)")
        }
    }
}

