const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf-8');

const startIndex = content.indexOf('<main className="mx-auto p-6 lg:p-10 transition-all duration-500 max-w-[1600px]">');
const endIndex = content.indexOf('</main>') + '</main>'.length;

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find <main> block');
  process.exit(1);
}

const replacement = `<main className="mx-auto p-6 lg:p-10 transition-all duration-500 max-w-[1600px]">
          <Suspense fallback={
            <div className="flex items-center justify-center h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <AnimatePresence mode="wait">
              {currentView === "competitorAnalysis" && (
                <CompetitorAnalysisView
                  error={error}
                  activeResultTab={activeResultTab}
                  setActiveResultTab={setActiveResultTab}
                  competitorUrl={competitorUrl}
                  setCompetitorUrl={setCompetitorUrl}
                  handleAnalyzeCompetitor={handleAnalyzeCompetitor}
                  isAnalyzingCompetitor={isAnalyzingCompetitor}
                  competitorAnalysisResults={competitorAnalysisResults}
                />
              )}
              {currentView === "photoShoot" && (
                <PhotoShootView
                  photoShootImages={photoShootImages}
                  handlePhotoShootUpload={handlePhotoShootUpload}
                  setPhotoShootImages={setPhotoShootImages}
                />
              )}
              {currentView === "whiteBackground" && (
                <WhiteBackgroundView
                  whiteBgImage={whiteBgImage}
                  setWhiteBgImage={setWhiteBgImage}
                  whiteBgResult={whiteBgResult}
                  isProcessingWhiteBg={isProcessingWhiteBg}
                  handleWhiteBackground={handleGenerateWhiteBg}
                />
              )}
              {currentView === "aPlusContent" && (
                <APlusContentView
                  aPlusImageB64={aPlusImageB64}
                  setAPlusImageB64={setAPlusImageB64}
                  handleAPlusImageUpload={handleAPlusImageUpload}
                  aPlusInput={aPlusInput}
                  setAPlusInput={setAPlusInput}
                  handleGenerateAPlus={handleGenerateAPlus}
                  isGeneratingAPlus={isGeneratingAPlus}
                  aPlusResult={aPlusResult}
                  error={error}
                />
              )}
              {currentView === "generator" && (
                <ListingGeneratorView
                  step={step}
                  setStep={setStep}
                  selectedPlatforms={selectedPlatforms}
                  setSelectedPlatforms={setSelectedPlatforms}
                  inputMethod={inputMethod}
                  setInputMethod={setInputMethod}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  imageB64={imageB64}
                  setImageB64={setImageB64}
                  backImageB64={backImageB64}
                  setBackImageB64={setBackImageB64}
                  tone={tone}
                  setTone={setTone}
                  pricingGoal={pricingGoal}
                  setPricingGoal={setPricingGoal}
                  useEmojis={useEmojis}
                  setUseEmojis={setUseEmojis}
                  seoFocus={seoFocus}
                  setSeoFocus={setSeoFocus}
                  isGenerating={isGenerating}
                  handleGenerate={handleGenerate}
                  results={results}
                  setResults={setResults}
                  activeResultTab={activeResultTab}
                  setActiveResultTab={setActiveResultTab}
                  generationProgress={generationProgress}
                  generationStatus={generationStatus}
                  handleRegenerateSection={handleRegenerateSection}
                  regeneratingSection={regeneratingSection}
                  copyToClipboard={copyToClipboard}
                  copiedField={copiedField}
                  exportResults={exportResults}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                  error={error}
                  PLATFORMS={PLATFORMS}
                  TONES={TONES}
                  getPlatformLimits={getPlatformLimits}
                  handleImageUpload={handleImageUpload}
                />
              )}
            </AnimatePresence>
          </Suspense>
        </main>`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/App.tsx', newContent);
console.log('Successfully replaced <main> block');
