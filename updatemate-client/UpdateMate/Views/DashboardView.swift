import SwiftUI

struct DashboardView: View {
    private let strategies = [UpdateStrategy.stableFirst, .versionLocked, .fullyManual]

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                Text(LocalizedStringKey("app.name"))
                    .font(.largeTitle)
                    .fontWeight(.bold)
                Text(LocalizedStringKey("app.slogan"))
                    .foregroundStyle(.secondary)

                ForEach(strategies) { strategy in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(LocalizedStringKey(strategy.titleKey))
                            .font(.headline)
                        Text(LocalizedStringKey(strategy.summaryKey))
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(nsColor: .windowBackgroundColor))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }

                Spacer()
            }
            .padding(24)
            .frame(minWidth: 760, minHeight: 520)
        }
    }
}

#Preview {
    DashboardView()
}
