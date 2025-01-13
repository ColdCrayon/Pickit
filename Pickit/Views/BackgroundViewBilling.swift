//
//  BackgroundView.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/13/25.
//

import SwiftUI

struct BackgroundViewBilling: View {
    var body: some View {
        LinearGradient(colors: [.billingBGLight, .billingBGDark], startPoint: .topLeading, endPoint: .bottomTrailing)
            .ignoresSafeArea(.all)
    }
}

#Preview {
    BackgroundViewBilling()
}
