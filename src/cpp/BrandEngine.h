#pragma once

#ifdef BRANDENGINE_EXPORTS
#define BRANDENGINE_API __declspec(dllexport)
#else
#define BRANDENGINE_API __declspec(dllimport)
#endif

extern "C" {
    BRANDENGINE_API int GetEngineVersion();
    BRANDENGINE_API double CalculateMatch(const char* s1, const char* s2);
    BRANDENGINE_API int CalculateScore(int t, int L);
}
