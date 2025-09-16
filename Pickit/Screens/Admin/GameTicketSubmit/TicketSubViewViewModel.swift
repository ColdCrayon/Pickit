//
//  TicketSubViewViewModel.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/6/25.
//

import FirebaseFirestore
import Foundation

final class TicketSubViewViewModel: ObservableObject {
    @Published var settled: Bool = false
    @Published var pickTeam: String = ""
    @Published var pickType: String = ""
    @Published var gameInfo: String = ""
//    @Published var publishDate: String = ""
    @Published var description: String = ""
    @Published var sportsbook: String = ""
    @Published var settleDate: Date = Date()
    
    @Published var errorMessage: String = ""
    
    let db = Firestore.firestore()
    
    init() {}
    
    /// Compares the settle date with Firebase server timestamp to determine if ticket should be visible on homepage
    func canViewTicketOnHomepage(completion: @escaping (Bool) -> Void) {
        // Get Firebase server timestamp
        let serverTimestampRef = db.collection("metadata").document("serverTime")
        
        serverTimestampRef.setData([
            "timestamp": FieldValue.serverTimestamp()
        ]) { [weak self] error in
            if let error = error {
                print("Error setting server timestamp: \(error)")
                completion(false)
                return
            }
            
            // Retrieve the server timestamp
            serverTimestampRef.getDocument { [weak self] document, error in
                guard let self = self else {
                    completion(false)
                    return
                }
                
                if let error = error {
                    print("Error getting server timestamp: \(error)")
                    completion(false)
                    return
                }
                
                guard let document = document,
                      document.exists,
                      let data = document.data(),
                      let serverTimestamp = data["timestamp"] as? Timestamp else {
                    print("Server timestamp not found")
                    completion(false)
                    return
                }
                
                // Compare settle date with server time
                let serverDate = serverTimestamp.dateValue()
                let settleTimeInterval = self.settleDate.timeIntervalSince1970
                let serverTimeInterval = serverDate.timeIntervalSince1970
                
                // Ticket is viewable on homepage if settle date is in the future (not yet settled)
                let canView = settleTimeInterval > serverTimeInterval
                
                DispatchQueue.main.async {
                    completion(canView)
                }
            }
        }
    }
    
    /// Alternative method using local time comparison (less reliable but faster)
    func canViewTicketOnHomepageLocal() -> Bool {
        let currentTime = Date().timeIntervalSince1970
        let settleTime = settleDate.timeIntervalSince1970
        
        // Ticket is viewable if it hasn't settled yet
        return settleTime > currentTime
    }
    
    func validateTicket() -> Bool {
        guard !pickTeam.trimmingCharacters(in: .whitespaces).isEmpty,
              !pickType.trimmingCharacters(in: .whitespaces).isEmpty,
              !gameInfo.trimmingCharacters(in: .whitespaces).isEmpty,
              !description.trimmingCharacters(in: .whitespaces).isEmpty,
//              !publishDate.trimmingCharacters(in: .whitespaces).isEmpty,
              !description.trimmingCharacters(in: .whitespaces).isEmpty,
              !sportsbook.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "Please Fill Out All Fields"
            return false
        }
        
        return true
    }
    
    func submitTicket() {
        guard validateTicket() else {
//            errorMessage = "Unable to Validate Ticket"
            return
        }
        
        insertTicketRecord(id: generateTicketId())
    }
    
    private func insertTicketRecord(id: String) {
        let newTicket = Ticket(id: id,
//                               settled: settled,
                               pickGameInfo: gameInfo,
                               pickPublishDate: getTicketDate(),
                               pickDescription: description,
                               pickSportsbook: sportsbook,
                               pickTeam: pickTeam,
                               pickType: pickType,
                               settleDate: settleDate.timeIntervalSince1970)
        
        gameInfo = ""
//        publishDate = ""
        description = ""
        sportsbook = ""
        pickTeam = ""
        pickType = ""
        
        let db = Firestore.firestore()
        
        db.collection("gameTickets")
            .document(id)
            .setData(newTicket.asDictionary())
    }
}

