import Foundation

final class StrategyEngine {
    private(set) var availableStrategies: [UpdateStrategy] = [
        .stableFirst,
        .versionLocked,
        .fullyManual,
    ]

    func defaultStrategy() -> UpdateStrategy {
        .stableFirst
    }
}
