import Foundation

final class ProfileManager {
    func checkProfileStatus() async throws -> String {
        "未安装描述文件"
    }

    func installProfile(for strategy: UpdateStrategy) async throws {
        _ = strategy
    }

    func renewProfile(for strategy: UpdateStrategy) async throws {
        _ = strategy
    }
}
