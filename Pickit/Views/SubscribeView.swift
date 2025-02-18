//
//  SubscribeView.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/9/25.
//

import SwiftUI

struct SubscribeView: View {
    var body: some View {
        ZStack {
            BackgroundViewBilling()
            
            AccountViewBilling(screenName: "", date: getCurrentDate(), accountName: "", isSubscribed: false)
        }
    }
}

#Preview {
    SubscribeView()
}

