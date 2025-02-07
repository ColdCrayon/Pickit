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
//    @Published var publishDate: String = ""
    @Published var description: String = ""
    @Published var sportsbook: String = ""
    
    @Published var errorMessage: String = ""
    
    init() {}
    
    func validateTicket() -> Bool {
        guard !pickTeam.trimmingCharacters(in: .whitespaces).isEmpty,
              !pickType.trimmingCharacters(in: .whitespaces).isEmpty,
              !gameInfo.trimmingCharacters(in: .whitespaces).isEmpty,
              !description.trimmingCharacters(in: .whitespaces).isEmpty,
//              !publishDate.trimmingCharacters(in: .whitespaces).isEmpty,
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
                               settled: settled,
                               pickGameInfo: gameInfo,
                               pickPublishDate: getTicketDate(),
                               pickDescription: description,
                               pickSportsbook: sportsbook,
                               pickTeam: pickTeam,
                               pickType: pickType)
        
        gameInfo = ""
//        publishDate = ""
        description = ""
        sportsbook = ""
        pickTeam = ""
        pickType = ""
        
        let db = Firestore.firestore()
        
        db.collection("gameTickets")
            .document(id)
            .setData(newTicket.asDictionary())
    }
}

