//
//  EXTPlaceholder.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/15/24.
//

import SwiftUI

extension View {
    func placeholder<Content: View>(
        when shouldShow: Bool,
        alignment: Alignment = .leading,
        @ViewBuilder placeholder: () -> Content) -> some View {

        ZStack(alignment: alignment) {
            placeholder().opacity(shouldShow ? 0.7 : 0)
            self
        }
    }
}
