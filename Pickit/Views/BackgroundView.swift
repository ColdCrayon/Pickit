//
//  BackgroundView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/10/24.
//

import SwiftUI

struct BackgroundView: View {
    var body: some View {
        Rectangle()
            .frame(width: .infinity, height: .infinity, alignment: .center)
            .ignoresSafeArea()
            .foregroundStyle(.mainBackground)
    }
}

#Preview {
    BackgroundView()
}
