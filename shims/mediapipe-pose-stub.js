// @tensorflow-models/pose-detection statically imports `Pose` from
// @mediapipe/pose to support the (unused, heavier) BlazePose/MediaPipe
// runtime. We only use the MoveNet/TFJS runtime, so this stub satisfies
// the bundler's static export analysis without shipping the real package.
export class Pose {}
export default { Pose }
