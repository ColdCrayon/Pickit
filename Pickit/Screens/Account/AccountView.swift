//
//  AccountView.swift
//  Pickit
//
//  Created by Cadel Saszik on 12/22/24.
//

import SwiftUI

struct AccountView: View {
    
    var screenName: String
    var date: String
    var accountName: String
    var isSubscribed: Bool
    
    @Binding var information: Bool
    @Binding var leftSectionActive: Bool
    
    @State var offset = CGSize.zero
    
    var body: some View {
        if leftSectionActive {
            ZStack {
                BackgroundView()
                
                AccountViewInformation(screenName: self.screenName,
                                       date: self.date,
                                       accountName: self.accountName,
                                       isSubscribed: self.isSubscribed)
                
                HeaderView2Section(screenName: self.screenName,
                                   date: self.date,
                                   accountName: self.accountName,
                                   isSubscribed: self.isSubscribed,
                                   leftSection: "Information",
                                   rightSection: "Billing",
                                   leftSectionActive: $leftSectionActive)
            }
        } else {
            ZStack {
//                LinearGradient(colors: [.billingBGLight, .billingBGDark], startPoint: .topLeading, endPoint: .bottomTrailing)
                BackgroundViewBilling()
                
                AccountViewBilling(screenName: self.screenName,
                                   date: self.date,
                                   accountName: self.accountName,
                                   isSubscribed: self.isSubscribed)
                
                HeaderView2Section(screenName: self.screenName,
                                   date: self.date,
                                   accountName: self.accountName,
                                   isSubscribed: self.isSubscribed,
                                   leftSection: "Information",
                                   rightSection: "Billing",
                                   leftSectionActive: $leftSectionActive)
            }
        }
        
        //        ZStack {
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
        //
        //            ZStack {
        //                LinearGradient(colors: [.billingBGLight, .billingBGDark], startPoint: .topLeading, endPoint: .bottomTrailing)
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
        //            .offset(offset)
        //            .gesture(
        //                DragGesture()
        //                    .onChanged { value in
        //                        withAnimation(.easeInOut(duration: 0.5)) {
        //                            offset = value.translation
        //                        }
        //                    }
        //
        //                    .onEnded { value in
        //                        withAnimation(.easeInOut(duration: 0.5)) {
        //                            offset = CGSize(width: screenWidth, height: 0)
        //                            leftSectionActive.toggle()
        //                        }
        //                    }
        //            )
        //        }
    }
}

#Preview {
    ZStack {
        AccountView(screenName: "Account",
                    date: getCurrentDate(),
                    accountName: "Cadel Saszik",
                    isSubscribed: true, information: .constant(true),
                    leftSectionActive: .constant(false))
        
        VStack {
            NavbarView(selectedTab: .constant(3))
        }
    }
}

