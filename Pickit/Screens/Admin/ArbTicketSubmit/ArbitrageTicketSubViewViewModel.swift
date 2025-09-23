//
//  ArbitrageTicketSubViewViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/5/25.
//

import FirebaseFirestore
import Foundation

final class ArbitrageTicketSubViewViewModel: ObservableObject {
    @Published var settled: Bool = false
    @Published var pickTeam: String = ""
    @Published var pickType: String = ""
    @Published var gameInfo: String = ""
    @Published var description: String = ""
    @Published var sportsbook1: String = ""
    @Published var sportsbook2: String = ""
    @Published var oddsSB1: String = ""
    @Published var oddsSB2: String = ""
    @Published var settleDate: Date = Date()
//    @Published var settleDate: Timestamp = Timestamp()
    @Published var serverSettled: Bool = false
    
    @Published var errorMessage: String = ""
    
    init() {}
    
    func validateTicket() -> Bool {
        guard !pickTeam.trimmingCharacters(in: .whitespaces).isEmpty,
              !pickType.trimmingCharacters(in: .whitespaces).isEmpty,
              !gameInfo.trimmingCharacters(in: .whitespaces).isEmpty,
              !description.trimmingCharacters(in: .whitespaces).isEmpty,
//              !publishDate.trimmingCharacters(in: .whitespaces).isEmpty,
              !description.trimmingCharacters(in: .whitespaces).isEmpty,
              !sportsbook1.trimmingCharacters(in: .whitespaces).isEmpty,
              !oddsSB1.trimmingCharacters(in: .whitespaces).isEmpty,
              !sportsbook2.trimmingCharacters(in: .whitespaces).isEmpty,
              !oddsSB2.trimmingCharacters(in: .whitespaces).isEmpty else {
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
        let newTicket = ArbitrageTicket(id: id,
                                        sportsBook1: sportsbook1,
                                        sportsBook2: sportsbook2,
                                        pickGameInfo: gameInfo,
                                        pickOddsSB1: oddsSB1,
                                        pickOddsSB2: oddsSB2,
                                        pickPublishDate: getTicketDate(),
                                        pickDescription: description,
                                        pickTeam: pickTeam,
                                        pickType: pickType,
                                        settleDate: Timestamp(date: settleDate),
                                        serverSettled: serverSettled)
        
        pickTeam = ""
        pickType = ""
        gameInfo = ""
        description = ""
        sportsbook1 = ""
        sportsbook2 = ""
        oddsSB1 = ""
        oddsSB2 = ""
        
        let db = Firestore.firestore()
        
        do {
            try db.collection("arbTickets")
                .document(id)
                .setData(from: newTicket)
        } catch {
            print("Error writing document: \(error)")
        }
    }
}
