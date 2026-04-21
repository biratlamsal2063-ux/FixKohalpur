import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginVertical: 8,
    },
    primaryButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    inputField: {
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        backgroundColor: COLORS.white,
        marginVertical: 6,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 12,
        marginHorizontal: 16,
    },
});