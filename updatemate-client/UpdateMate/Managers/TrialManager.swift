import Foundation

final class TrialManager {
    func startTrial() async throws -> Date {
        Calendar.current.date(byAdding: .day, value: 7, to: Date()) ?? Date()
    }

    func checkTrialStatus() async throws -> Bool {
        true
    }
}
