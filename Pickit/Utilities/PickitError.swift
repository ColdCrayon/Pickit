//
//  APError.swift
//  Appetizers
//
//  Created by Cadel Saszik on 12/3/24.
//

import Foundation

enum PickitError: Error {
    case invalidURL
    case invalidResponse
    case invalidData
    case unableToComplete
}
