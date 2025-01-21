//
//  SubscribeButton.swift
//  Pickit
//
//  Created by Cadel Saszik on 1/16/25.
//

import SwiftUI

struct AnimatedButton: View {
    
    let title: String
    let topColor: Color
    let bottomColor: Color
    let width: CGFloat
    
    let action: () -> Void
    
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
            print("Clicked")
            action()
        } label: {
            ZStack{
                Rectangle()
                    .frame(width: width, height: 50)
                    .foregroundStyle(bottomColor)
                    .cornerRadius(20)
                    .offset(y: 9)
                Rectangle()
                    .frame(width: width, height: 50)
                    .foregroundStyle(topColor)
                    .cornerRadius(20)
                    .offset(y: CGFloat(hasPressed ? subButtonOffset : 0))
                    .simultaneousGesture(buttonPress)
                Text(title)
                    .font(Font.custom("Lexend", size: 24))
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                    .offset(y: CGFloat(hasPressed ? subButtonOffset : 0))
                    .simultaneousGesture(buttonPress)
            }
        }
    }
}

#Preview {
    AnimatedButton(title: "Title", topColor: .midBlue, bottomColor: .darkBlue, width: 200) {
        
    }
}
