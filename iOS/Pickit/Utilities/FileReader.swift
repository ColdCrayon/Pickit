//
//  FileReader.swift
//  Pickit
//
//  Created by Cadel Saszik on 2/9/25.
//

import Foundation

class ModelTOS: ObservableObject {
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

class ModelPP: ObservableObject {
    @Published var data: String = ""
    init() { self.load(file: "PrivacyPolicy") }
    
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
