//
//  PrivacyPolicySheetView.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/7/25.
//

import SwiftUI

struct PrivacyPolicySheetView: View {
    
    @StateObject var model = ModelPP()
    
    var body: some View {
        ZStack {
            BackgroundViewBilling()
            
            Rectangle()
                .frame(width: screenWidth - 50, height: screenHeight * 0.7)
                .cornerRadius(30)
                .overlay {
                    ScrollView {
                        VStack {
                            Text("Privacy Policy")
                                .font(Font.custom("Lexend", size: 32))
                                .fontWeight(.bold)
                                .padding(.top, 32)
                                .padding(.bottom, 8)
                                .foregroundStyle(.black)
                            
                            Text(model.data)
                                .frame(maxWidth: screenWidth)
                                .font(Font.custom("Lexend", size: 14))
                                .fontWeight(.bold)
                                .foregroundStyle(.black)
                        }
                    }
                    .scrollIndicators(.hidden)
                    .padding([.leading, .trailing], 20)
                    .background(
                        RoundedRectangle(cornerRadius: 30, style: .continuous)
                            .fill(
                                .shadow(.inner(color: Color.black.opacity(0.8), radius: 10, x: 0, y: 0))
                            )
                    )
                }
        }
    }
}

#Preview {
    PrivacyPolicySheetView()
}
