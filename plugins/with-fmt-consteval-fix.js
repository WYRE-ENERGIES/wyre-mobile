const fs = require('fs');
const path = require('path');

const { withDangerousMod } = require('expo/config-plugins');

const FMT_MARKER = 'WYRE_FMT_CONSTEVAL_PATCH';
const RNFB_MARKER = 'WYRE_RNFB_PODFILE';

const FMT_PODFILE_SNIPPET = `
    # ${FMT_MARKER}: Xcode 26 clang rejects fmt 11.0.2 consteval format strings.
    fmt_base_header = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base_header)
      fmt_source = File.read(fmt_base_header)
      unless fmt_source.include?('${FMT_MARKER}')
        patched_source = fmt_source.sub(
          '#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L',
          '#elif defined(__apple_build_version__)  // ${FMT_MARKER}'
        )
        if patched_source != fmt_source
          File.chmod(0644, fmt_base_header)
          File.write(fmt_base_header, patched_source)
        end
      end
    end
`;

const RNFB_PODFILE_SNIPPET = `# ${RNFB_MARKER}
$RNFirebaseDisableSPM = true
$RNFirebaseAsStaticFramework = true
$FirebaseSDKVersion = '12.17.0'

`;

function ensureFmtPatch(contents) {
  if (contents.includes(FMT_MARKER)) return contents;
  const anchor = 'post_install do |installer|\n';
  if (!contents.includes(anchor)) {
    throw new Error('withFmtConstevalFix: could not find post_install hook in Podfile');
  }
  return contents.replace(anchor, `${anchor}${FMT_PODFILE_SNIPPET}`);
}

function ensureRnfbVars(contents) {
  if (contents.includes(RNFB_MARKER)) {
    if (!contents.includes('$RNFirebaseDisableSPM')) {
      return contents.replace(`# ${RNFB_MARKER}\n`, `# ${RNFB_MARKER}\n$RNFirebaseDisableSPM = true\n`);
    }
    return contents;
  }
  const anchor = 'prepare_react_native_project!\n';
  if (!contents.includes(anchor)) {
    throw new Error('withFmtConstevalFix: could not find prepare_react_native_project! in Podfile');
  }
  return contents.replace(anchor, `${anchor}\n${RNFB_PODFILE_SNIPPET}`);
}

const withFmtConstevalFix = (config) =>
  withDangerousMod(config, [
    'ios',
    (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');
      contents = ensureRnfbVars(contents);
      contents = ensureFmtPatch(contents);
      fs.writeFileSync(podfilePath, contents);
      return modConfig;
    },
  ]);

module.exports = withFmtConstevalFix;
