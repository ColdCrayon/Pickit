//
//  TicketEntryView.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/20/25.
//

import SwiftUI

struct TicketEntryView: View {
    
    var entryTitle: String
    @Binding var entryValue: String
    
    var body: some View {
        TextField("", text: $entryValue)
            .placeholder(when: entryValue.isEmpty) {
                Text(entryTitle)
            }
            .font(Font.custom("Lexend", size: 16))
            .fontWeight(.bold)
            .opacity(0.6)
            .keyboardType(.default)
            .autocorrectionDisabled()
    }
}

#Preview {
    TicketEntryView(entryTitle: "Title", entryValue: .constant("Value"))
}
