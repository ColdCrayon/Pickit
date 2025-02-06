//
//  IdGenerator.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/6/25.
//

import SwiftUI

struct idData {
    let year: Int
    let month: Int
    let day: Int
    let hour: Int
    let minute: Int
    let second: Int
}

func generateTicketId() -> String {
    let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute, .second], from: Date.now)
    
    let idInfo = idData(year: components.year ?? 0,
                        month: components.month ?? 0,
                        day: components.day ?? 0,
                        hour: components.hour ?? 0,
                        minute: components.minute ?? 0,
                        second: components.second ?? 0)
    let idString = "\(idInfo.year)\(idInfo.month)\(idInfo.day)\(idInfo.hour)\(idInfo.minute)\(idInfo.second)"
    
    return idString
}
