//
//  Ticket.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/10/24.
//

import Foundation

struct Ticket: Codable, Identifiable {
    var id: String
    
//    let settled: Bool
    
    public var settled: Bool {
        if(settleDate <= Date.now.timeIntervalSince1970) {
            return true
        }
        
        return false
    }
    
    let pickGameInfo: String
    let pickPublishDate: String
    let pickDescription: String
    let pickSportsbook: String
    let pickTeam: String
    let pickType: String
    
    let settleDate: TimeInterval
}

struct ArbitrageTicket: Codable, Identifiable {
    var id: String
    
//    let settled: Bool
    
    public var settled: Bool {
        if(settleDate <= Date.now.timeIntervalSince1970) {
            return true
        }
        
        return false
    }
    
    let sportsBook1: String
    let sportsBook2: String
    let pickGameInfo: String
    let pickOddsSB1: String
    let pickOddsSB2: String
    let pickPublishDate: String
    let pickDescription: String
    let pickTeam: String
    let pickType: String
    
    let settleDate: TimeInterval
}

struct Account: Decodable, Identifiable {
    var id: Int
    
    let username: String
    let email: String
    let password: String
    
    let accountName: String
    let isSubscribed: Bool
    let admin: Bool
}

struct TicketResponse: Decodable {
    let request: [Ticket]
}

let dateInterval: TimeInterval = Date.now.timeIntervalSince1970
let date: Date = Date()

struct MockTicket {
    static let sampleTicket = Ticket(id: "",
//                                     settled: true,
                                     pickGameInfo: "Atlanta Falcons vs. Minnesota Vikings",
                                     pickPublishDate: "Dec 8, 2024 at 7:58 PM",
                                     pickDescription: "The Minnesota Vikings have been on a tremendous run this year leading to much success on the field. While the falcons have been playing decently withe new QB Kirk Cousins, the Vikings have better players in seemingly every position.",
                                     pickSportsbook: "Fandual",
                                     pickTeam: "Minnesota Vikings",
                                     pickType: "Moneyline",
                                     settleDate: dateInterval)
    
    static let sampleArbitrageTicket = ArbitrageTicket(id: "",
                                                       sportsBook1: "Draftkings",
                                                       sportsBook2: "Fandual",
                                                       pickGameInfo: "Buffalo Bills vs. Kansas City Cheifs",
                                                       pickOddsSB1: "-210",
                                                       pickOddsSB2: "+180",
                                                       pickPublishDate: "Dec 10, 2024 at 1:10 PM",
                                                       pickDescription: "The Buffalo Bills are the better team",
                                                       pickTeam: "Buffalo Bills",
                                                       pickType: "Moneyline",
                                                       settleDate: dateInterval)
    
    static let sampleArbitrageTicket2 = ArbitrageTicket(id: "",
                                                        sportsBook1: "Draftkings",
                                                        sportsBook2: "Fandual",
                                                        pickGameInfo: "Buffalo Bills vs. Kansas City Cheifs",
                                                        pickOddsSB1: "-210",
                                                        pickOddsSB2: "+180",
                                                        pickPublishDate: "Dec 10, 2024 at 1:10 PM",
                                                        pickDescription: "The Buffalo Bills are the better team",
                                                        pickTeam: "Buffalo Bills",
                                                        pickType: "Moneylin",
                                                        settleDate: dateInterval)
    
    static let sampleTickets = [sampleTicket, sampleTicket, sampleTicket, sampleTicket]
    
    static let sampleArbitrageTickets = [sampleArbitrageTicket, sampleArbitrageTicket2, sampleArbitrageTicket, sampleArbitrageTicket2]
}
