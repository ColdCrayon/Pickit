//
//  TOSSheetView.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/7/25.
//

import SwiftUI

struct TOSSheetView: View {
    
    @StateObject var model = Model()
    
    var body: some View {
        ZStack {
            BackgroundViewBilling()
            
            Rectangle()
                .frame(width: screenWidth - 50, height: screenHeight * 0.7)
                .cornerRadius(30)
                .overlay {
                    ScrollView {
                        VStack {
                            Text("Terms of Service")
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

class Model: ObservableObject {
    @Published var data: String = ""
    init() { self.load(file: "TOS") }
    
    func load(file: String) {
        if let filepath = Bundle.main.path(forResource: file, ofType: "md") {
            do {
                let contents = try String(contentsOfFile: filepath, encoding: .utf8)
                DispatchQueue.main.async {
                    self.data = contents
                }
            } catch let error as NSError {
                print(error.localizedDescription)
            }
        } else {
            print("File not found")
        }
    }
}


#Preview {
    TOSSheetView()
}
