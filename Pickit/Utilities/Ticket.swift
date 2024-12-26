//
//  Ticket.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/10/24.
//

import Foundation

struct Ticket: Decodable, Identifiable {
    var id: Int
    
    let settled: Bool
    let pickGameInfo: String
    let pickPublishDate: String
    let pickDescription: String
    let pickSportsbook: String
    let pickTeam: String
    let pickType: String
}

struct ArbitrageTicket: Decodable, Identifiable {
    var id: Int
    
    let settled: Bool
    let sportsBook1: String
    let sportsBook2: String
    let pickGameInfo: String
    let pickOddsSB1: String
    let pickOddsSB2: String
    let pickPublishDate: String
    let pickDescription: String
    let pickTeam: String
    let pickType: String
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

struct MockTicket {
    static let sampleTicket = Ticket(id: 0001,
                                     settled: true,
                                     pickGameInfo: "Atlanta Falcons vs. Minnesota Vikings",
                                     pickPublishDate: "Dec 8, 2024 at 7:58 PM",
                                     pickDescription: "The Minnesota Vikings have been on a tremendous run this year leading to much success on the field. While the falcons have been playing decently withe new QB Kirk Cousins, the Vikings have better players in seemingly every position.",
                                     pickSportsbook: "Fandual",
                                     pickTeam: "Minnesota Vikings",
                                     pickType: "Moneyline")
    
    static let sampleArbitrageTicket = ArbitrageTicket(id: 001,
                                                       settled: false,
                                                       sportsBook1: "Draftkings",
                                                       sportsBook2: "Fandual",
                                                       pickGameInfo: "Buffalo Bills vs. Kansas City Cheifs",
                                                       pickOddsSB1: "-210",
                                                       pickOddsSB2: "+180",
                                                       pickPublishDate: "Dec 10, 2024 at 1:10 PM",
                                                       pickDescription: "The Buffalo Bills are the better team",
                                                       pickTeam: "Buffalo Bills",
                                                       pickType: "Moneyline")
    
    static let sampleTickets = [sampleTicket, sampleTicket, sampleTicket, sampleTicket]
    
    static let sampleArbitrageTickets = [sampleArbitrageTicket, sampleArbitrageTicket, sampleArbitrageTicket]
}
