//
//  DatePicker.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/9/24.
//

import SwiftUI

struct CurrentDate {
    let month: Int
    let day: Int
    let year: Int
}

func getCurrentDate() -> String {
    let components = Calendar.current.dateComponents([.month, .day, .year], from: Date.now)
    
    let DateInfo = CurrentDate(month: components.month ?? 0, day: components.day ?? 0, year: components.year ?? 0)
    let DateString = "\(DateInfo.month)/\(DateInfo.day)/\(DateInfo.year)"
    
    return DateString
}
