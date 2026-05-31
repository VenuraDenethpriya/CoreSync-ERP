package util

// Map function that applies a transformation to each element in the slice
func Map[T any, U any](input []T, transform func(T) U) []U {
	output := make([]U, len(input))
	for i, v := range input {
		output[i] = transform(v)
	}
	return output
}
