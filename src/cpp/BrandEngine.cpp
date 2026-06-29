#define BRANDENGINE_EXPORTS
#include "BrandEngine.h"
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>

int LevenshteinDistance(const std::string& s1, const std::string& s2) {
    int len1 = s1.size();
    int len2 = s2.size();
    std::vector<std::vector<int>> dp(len1 + 1, std::vector<int>(len2 + 1));

    for (int i = 0; i <= len1; ++i) dp[i][0] = i;
    for (int j = 0; j <= len2; ++j) dp[0][j] = j;

    for (int i = 1; i <= len1; ++i) {
        for (int j = 1; j <= len2; ++j) {
            int cost = (s1[i - 1] == s2[j - 1]) ? 0 : 1;
            dp[i][j] = std::min({ dp[i - 1][j] + 1,
                                 dp[i][j - 1] + 1,
                                 dp[i - 1][j - 1] + cost 
                               });
        }
    }
    return dp[len1][len2];
}

extern "C" {
    BRANDENGINE_API double CalculateMatch(const char* s1, const char* s2) {
        if (!s1 || !s2) return 0.0;
        std::string str1(s1);
        std::string str2(s2);

        std::transform(str1.begin(), str1.end(), str1.begin(), ::tolower);
        std::transform(str2.begin(), str2.end(), str2.begin(), ::tolower);

        str1.erase(std::remove_if(str1.begin(), str1.end(), ::isspace), str1.end());
        str2.erase(std::remove_if(str2.begin(), str2.end(), ::isspace), str2.end());

        int dist = LevenshteinDistance(str1, str2);
        int maxLen = std::max(str1.length(), str2.length());

        if (maxLen == 0) return 100.0;

        double match = (1.0 - (double)dist / maxLen) * 100.0;
        return match < 0.0 ? 0.0 : match;
    }

    BRANDENGINE_API int CalculateScore(int t, int L) {
        int calculated = (100 - t) * L;
        return std::max(10, calculated);
    }
}
