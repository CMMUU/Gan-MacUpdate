import Foundation

struct UpdateStrategy: Identifiable, Codable, Hashable {
    let id: String
    let titleKey: String
    let summaryKey: String
    let allowsMinorUpdates: Bool
    let allowsSecurityUpdates: Bool
    let majorDelayDays: Int?
}

extension UpdateStrategy {
    static let stableFirst = UpdateStrategy(
        id: "stable-first",
        titleKey: "strategy.stability_first.title",
        summaryKey: "strategy.stability_first.summary",
        allowsMinorUpdates: true,
        allowsSecurityUpdates: true,
        majorDelayDays: 90
    )

    static let versionLocked = UpdateStrategy(
        id: "version-locked",
        titleKey: "strategy.version_lock.title",
        summaryKey: "strategy.version_lock.summary",
        allowsMinorUpdates: true,
        allowsSecurityUpdates: true,
        majorDelayDays: 90
    )

    static let fullyManual = UpdateStrategy(
        id: "fully-manual",
        titleKey: "strategy.full_control.title",
        summaryKey: "strategy.full_control.summary",
        allowsMinorUpdates: false,
        allowsSecurityUpdates: false,
        majorDelayDays: 90
    )
}
