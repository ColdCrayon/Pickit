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
    @Published var publishDate: String = ""
    @Published var description: String = ""
    @Published var sportsbook1: String = ""
    @Published var sportsbook2: String = ""
    @Published var oddsSB1: String = ""
    @Published var oddsSB2: String = ""
    
    init() {}
    
    private func createTicket(id: String) {
        let newTicket = ArbitrageTicket(id: getCurrentDate(),
                                        settled: settled,
                                        sportsBook1: sportsbook1,
                                        sportsBook2: sportsbook2,
                                        pickGameInfo: gameInfo,
                                        pickOddsSB1: oddsSB1,
                                        pickOddsSB2: oddsSB2,
                                        pickPublishDate: publishDate,
                                        pickDescription: description,
                                        pickTeam: pickTeam,
                                        pickType: pickType)
        
        let db = Firestore.firestore()
        
        db.collection("arbTickets")
            .document(id)
            .setData(newTicket.asDictionary())
    }
}
