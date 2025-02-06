//
//  IdGenerator.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/6/25.
//

import SwiftUI

struct idData {
    let year: Int
    let month: String
    let day: String
    let hour: String
    let minute: String
    let second: String
}

func generateTicketId() -> String {
    let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: Date.now)
    
    let idInfo = idData(year: components.year ?? 0,
                        month: Date.now.formatted(.dateTime.month(.twoDigits)),
                        day: Date.now.formatted(.dateTime.day(.twoDigits)),
                        hour: Date.now.formatted(.dateTime.hour(.twoDigits(amPM: .omitted))),
                        minute: Date.now.formatted(.dateTime.minute(.twoDigits)),
                        second: Date.now.formatted(.dateTime.second(.twoDigits)))
    let idString = "\(idInfo.year)\(idInfo.month)\(idInfo.day)\(idInfo.hour)\(idInfo.minute)\(idInfo.second)"
    
    return idString
}
