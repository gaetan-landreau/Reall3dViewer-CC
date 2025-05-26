import * as fs from 'fs';
import * as path from 'path';

// Define an interface for the expected structure of the car properties
interface CarPropertyValues {
    car_center?: number[]; 
    lookup_vector?: number[]; 
    cam_location_init?: number[]; 
    [key: string]: any; // Allow other keys if necessary, or remove if strictly these three
}

/**
 * Reads a JSON file from the given file path and extracts specific car properties.
 * @param jsonFilePath The absolute path to the JSON file.
 * @returns A promise that resolves with an object containing the specified car properties, or rejects with an error.
 */

import carPropertiesJson from '../../../assets/car_pose_info.json';

export async function getCarProperties(): Promise<CarPropertyValues> {
    const { car_center, orthonormal_matrix, cam_location_init } = carPropertiesJson;

    return {
        car_center,
        lookup_vector: orthonormal_matrix[1],
        cam_location_init
    };
}
