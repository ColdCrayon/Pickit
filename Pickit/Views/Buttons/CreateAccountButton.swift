//
//  SubscribeButton.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/16/25.
//

import SwiftUI

struct CreateAccountButton: View {
    
    @State private var subButtonOffset = 9
    @State private var hasPressed = false
    
    var buttonPress: some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged({ value in
                withAnimation(.smooth(duration: 0.15)) {
                    hasPressed = true
                }
            })
            .onEnded({ value in
                withAnimation(.easeInOut(duration: 0.2)) {
                    hasPressed = false
                }
            })
    }
    
    var body: some View {
        Button {
            
        } label: {
            ZStack{
                Rectangle()
                    .frame(width: 150, height: 50)
                    .foregroundStyle(.ticketSubButtonDark)
                    .cornerRadius(20)
                    .offset(y: 9)
                Rectangle()
                    .frame(width: 150, height: 50)
                    .foregroundStyle(.ticketSubButtonLight)
                    .cornerRadius(20)
                    .offset(y: CGFloat(hasPressed ? subButtonOffset : 0))
                    .gesture(buttonPress)
                Text("CREATE")
                    .font(Font.custom("Lexend", size: 22))
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                    .offset(y: CGFloat(hasPressed ? subButtonOffset : 0))
                    .gesture(buttonPress)
            }
        }
    }
}

#Preview {
    CreateAccountButton()
}
