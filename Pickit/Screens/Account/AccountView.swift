//
//  AccountView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/22/24.
//

import SwiftUI

struct AccountView: View {
    
    @StateObject var viewModel = AccountViewViewModel()
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    @Binding var information: Bool
    @Binding var leftSectionActive: Bool
    @Binding var selectedTab: Int
    
    @State var offset: CGFloat = screenWidth + 20
    
    var drag: some Gesture {
        DragGesture(minimumDistance: screenWidth / 4)
            .onChanged({ value in
                if offset > 0 { offset = screenWidth + value.translation.width }
            })
            .onEnded({ value in
                withAnimation(.easeInOut(duration: 0.1)) {
                    leftSectionActive.toggle()
                    if offset > 0 { offset = 0 } else if offset == 0 { offset = screenWidth + 20}
                }
            })
    }
    
    var body: some View {
        //        if leftSectionActive {
        //            ZStack {
        //                BackgroundView()
        //
        //                AccountViewInformation(screenName: self.screenName,
        //                                       date: self.date,
        //                                       accountName: self.accountName,
        //                                       isSubscribed: self.isSubscribed)
        //
        //                HeaderView2Section(screenName: self.screenName,
        //                                   date: self.date,
        //                                   accountName: self.accountName,
        //                                   isSubscribed: self.isSubscribed,
        //                                   leftSection: "Information",
        //                                   rightSection: "Billing",
        //                                   leftSectionActive: $leftSectionActive)
        //            }
        //        } else {
        //            ZStack {
        //                BackgroundViewBilling()
        //
        //                AccountViewBilling(screenName: self.screenName,
        //                                   date: self.date,
        //                                   accountName: self.accountName,
        //                                   isSubscribed: self.isSubscribed)
        //
        //                HeaderView2Section(screenName: self.screenName,
        //                                   date: self.date,
        //                                   accountName: self.accountName,
        //                                   isSubscribed: self.isSubscribed,
        //                                   leftSection: "Information",
        //                                   rightSection: "Billing",
        //                                   leftSectionActive: $leftSectionActive)
        //            }
        //        }
        
        ZStack {
            ZStack {
                ZStack {
                    BackgroundView()
                    
                    AccountViewInformation(screenName: self.screenName,
                                           date: self.date,
                                           accountName: self.accountName,
                                           isSubscribed: self.isSubscribed,
                                           selectedTab: $selectedTab)
                }
                .gesture(drag)
                
                if(!viewModel.isPremium) {
                    ZStack{
                        BackgroundViewBilling()
                        
                        AccountViewBilling(screenName: self.screenName,
                                           date: self.date,
                                           accountName: self.accountName,
                                           isSubscribed: self.isSubscribed)
                    }
                    .gesture(drag)
                    .offset(x: offset)
                }
            }
            
            if(viewModel.isPremium) {
                HeaderView1Section(screenName: self.screenName,
                                   date: getCurrentDate(),
                                   accountName: self.accountName,
                                   isSubscribed: true,
                                   section: "Information")
            } else if (!viewModel.isPremium){
                HeaderView2Section(screenName: self.screenName,
                                   date: self.date,
                                   accountName: self.accountName,
                                   isSubscribed: false,
                                   leftSection: "Information",
                                   rightSection: "Billing",
                                   leftSectionActive: $leftSectionActive)
            }
        }
    }
}

#Preview {
    ZStack {
        AccountView(screenName: "Account",
                    date: getCurrentDate(),
                    accountName: "Cadel Saszik",
                    isSubscribed: true,
                    information: .constant(true),
                    leftSectionActive: .constant(true),
                    selectedTab: .constant(3))
        
        VStack {
            NavbarView(selectedTab: .constant(3))
        }
    }
}

